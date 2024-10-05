/*
 * Copyright 2012-2014 Brandon Beck
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {RefillStrategy} from "./TokenBucket";
import {Ticker} from "./Ticker";

/**
 * A token bucket refill strategy that will provide N tokens for a token bucket to consume every T units of time.
 * The tokens are refilled in bursts rather than at a fixed rate.  This refill strategy will never allow more than
 * N tokens to be consumed during a window of time T.
 */
export class FixedIntervalRefillStrategy implements RefillStrategy {

        private readonly ticker: Ticker
        private readonly numTokensPerPeriod: number
        private readonly periodMillis: number

        private lastRefillTime: number
        private nextRefillTime: number


    constructor(
            ticker: Ticker,
            numTokensPerPeriod: number,
            periodMillis: number
        ) {
            this.ticker = ticker
            this.numTokensPerPeriod = numTokensPerPeriod
            this.periodMillis = periodMillis
            this.lastRefillTime =  -this.periodMillis
            this.nextRefillTime =  -this.periodMillis
        }


    refill(): number {
            const now =  this.ticker.read()
            if (now < this.nextRefillTime) {
                return 0
            }
            // We now know that we need to refill the bucket with some tokens, the question is how many.  We need to count how
            // many periods worth of tokens we've missed.
            const numPeriods = Math.max(0, (now - this.lastRefillTime) / this.periodMillis);

            // Move the last refill time forward by this many periods.
            this.lastRefillTime += numPeriods * this.periodMillis

            // ...and we'll refill again one period after the last time we refilled.
            this.nextRefillTime = this.lastRefillTime + this.periodMillis

            return numPeriods * this.numTokensPerPeriod
    }

    getMillisUntilNextRefill(): number {
        const now = this.ticker.read()
        return Math.max(0, this.nextRefillTime - now)
    }
}