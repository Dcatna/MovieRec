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

import {RefillStrategy, SleepStrategy, TokenBucket} from "./TokenBucket";
import {SYSTEM_TICKER} from "./Ticker";
import {TokenBucketImpl} from "./TokenBucketImpl";
import {FixedIntervalRefillStrategy} from "./FixedIntervalRefillStrategy";

const YIELDING_SLEEP_STRATEGY: SleepStrategy = {
    sleep(): Promise<void> {
       return new Promise(resolve => setTimeout(resolve, 1) );
    }
}

const BUSY_WAIT_SLEEP_STRATEGY: SleepStrategy = {
    sleep() {
        // Do nothing, don't sleep.
        return Promise.resolve()
    }
}

class TokenBucketBuilder {
    private  capacity: number | undefined = undefined
    private  initialTokens: number = 0
    private  refillStrategy: RefillStrategy | undefined = undefined
    private  sleepStrategy: SleepStrategy = YIELDING_SLEEP_STRATEGY
    private  ticker = SYSTEM_TICKER

    /** Specify the overall capacity of the token bucket.  */
    withCapacity(numTokens: number): TokenBucketBuilder {
        console.assert(numTokens > 0, "Must specify a positive number of tokens")
        this.capacity = numTokens
        return this
    }

    /** Initialize the token bucket with a specific number of tokens.  */
    withInitialTokens(numTokens: number): TokenBucketBuilder {
        console.assert(numTokens > 0,  "Must specify a positive number of tokens")
        this.initialTokens = numTokens
        return this
    }

    /** Refill tokens at a fixed interval.  */
    withFixedIntervalRefillStrategy(
        refillTokens: number,
        periodMillis: number,
    ): TokenBucketBuilder {
        return this.withRefillStrategy(
            new FixedIntervalRefillStrategy(
                this.ticker,
                refillTokens,
                periodMillis,
            )
        )
    }

    /** Use a user defined refill strategy.  */
    withRefillStrategy(refillStrategy: RefillStrategy): TokenBucketBuilder {
        this.refillStrategy = refillStrategy
        return this
    }

    /** Use a sleep strategy that will always attempt to yield the CPU to other processes.  */
    withYieldingSleepStrategy(): TokenBucketBuilder {
        return this.withSleepStrategy(YIELDING_SLEEP_STRATEGY)
    }

    /**
     * Use a sleep strategy that will not yield the CPU to other processes.  It will busy wait until more tokens become
     * available.
     */
    withBusyWaitSleepStrategy(): TokenBucketBuilder {
        return this.withSleepStrategy(BUSY_WAIT_SLEEP_STRATEGY)
    }

    /** Use a user defined sleep strategy.  */
    withSleepStrategy(sleepStrategy: SleepStrategy): TokenBucketBuilder {
        this.sleepStrategy = sleepStrategy
        return this
    }

    /** Build the token bucket.  */
    build(): TokenBucket {

        console.assert(this.capacity !== undefined,  "Must specify a capacity")
        console.assert(this.refillStrategy !== undefined, "Must specify a refill strategy")

        return new TokenBucketImpl(
            this.capacity!!,
            this.initialTokens,
            this.refillStrategy!!,
            this.sleepStrategy
        )
    }
}

export type TokenBucketsType  = {
    builder(): TokenBucketBuilder
}

/** Static utility methods pertaining to creating [TokenBucketImpl] instances.  */
export const TokenBuckets: TokenBucketsType = {

    /** Create a new builder for token buckets.  */
    builder(): TokenBucketBuilder {
        return new TokenBucketBuilder()
    }
}