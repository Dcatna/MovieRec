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

/**
 * A token bucket implementation that is of a leaky bucket in the sense that it has a finite capacity and any added
 * tokens that would exceed this capacity will "overflow" out of the bucket and are lost forever.
 * <p/>
 * In this implementation the rules for refilling the bucket are encapsulated in a provided {@code RefillStrategy}
 * instance.  Prior to attempting to consume any tokens the refill strategy will be consulted to see how many tokens
 * should be added to the bucket.
 * <p/>
 * In addition in this implementation the method of yielding CPU control is encapsulated in the provided
 * {@code SleepStrategy} instance.  For high performance applications where tokens are being refilled incredibly quickly
 * and an accurate bucket implementation is required, it may be useful to never yield control of the CPU and to instead
 * busy wait.  This strategy allows the caller to make this decision for themselves instead of the library forcing a
 * decision.
 */
export class TokenBucketImpl implements TokenBucket {

    capacity: number;
    private refillStrategy: RefillStrategy;
    private sleepStrategy: SleepStrategy;
    private size: number;

    constructor(
        capacity: number,
        initialTokens: number,
        refillStrategy: RefillStrategy,
        sleepStrategy: SleepStrategy
    ) {
        console.assert(capacity > 0);
        console.assert(initialTokens <= capacity);

        this.capacity = capacity;
        this.refillStrategy = refillStrategy;
        this.sleepStrategy = sleepStrategy;
        this.size = initialTokens;
    }

    /**
     * Returns the current number of tokens in the bucket.  If the bucket is empty then this method will return 0.
     *
     * @return The current number of tokens in the bucket.
     */
    numTokens(): number {
        // Give the refill strategy a chance to add tokens if it needs to so that we have an accurate
        // count.
        this.refill(this.refillStrategy.refill());
        return this.size;
    }

    /**
     * Returns the amount of time in the specified time unit until the next group of tokens can be added to the token
     * bucket.
     *
     * @see org.isomorphism.util.TokenBucket.RefillStrategy#getDurationUntilNextRefill(java.util.concurrent.TimeUnit)
     * @param unit The time unit to express the return value in.
     * @return The amount of time until the next group of tokens can be added to the token bucket.
     */
    getMillisUntilNextRefill(): number {
        return this.refillStrategy.getMillisUntilNextRefill();
    }

    /**
     * Attempt to consume a single token from the bucket.  If it was consumed then {@code true} is returned, otherwise
     * {@code false} is returned.
     *
     * @return {@code true} if a token was consumed, {@code false} otherwise.
     */
    tryConsume(): Promise<boolean> {
        return this.tryConsumeAmount(1);
    }

    /**
     * Attempt to consume a specified number of tokens from the bucket.  If the tokens were consumed then {@code true}
     * is returned, otherwise {@code false} is returned.
     *
     * @param numTokens The number of tokens to consume from the bucket, must be a positive number.
     * @return {@code true} if the tokens were consumed, {@code false} otherwise.
     */
    tryConsumeAmount(numTokens: number): Promise<boolean> {
        console.assert(numTokens > 0, "Number of tokens to consume must be positive");
        console.assert(numTokens <= this.capacity, "Number of tokens to consume must be less than the capacity of the bucket.");

        this.refill(this.refillStrategy.refill());

        // Now try to consume some tokens
        if (numTokens <= this.size) {
            this.size -= numTokens;
            return Promise.resolve(true);
        }

        return Promise.resolve(false);
    }

    /**
     * Consume a single token from the bucket.  If no token is currently available then this method will block until a
     * token becomes available.
     */
    consume(): Promise<void> {
        return this.consumeAmount(1);
    }

    /**
     * Consumes multiple tokens from the bucket.  If enough tokens are not currently available then this method will block
     * until
     *
     * @param numTokens The number of tokens to consume from teh bucket, must be a positive number.
     */
    async consumeAmount(numTokens: number): Promise<void> {
        while (true) {
            if (await this.tryConsumeAmount(numTokens)) {
                break;
            }
            await this.sleepStrategy.sleep();
        }
        return Promise.resolve()
    }

    /**
     * Refills the bucket with the specified number of tokens.  If the bucket is currently full or near capacity then
     * fewer than {@code numTokens} may be added.
     *
     * @param numTokens The number of tokens to add to the bucket.
     */
    refill(numTokens: number)
    {
        const newTokens: number = Math.min(this.capacity, Math.max(0, numTokens));
        this.size = Math.max(0, Math.min(this.size + newTokens, this.capacity));
    }
}
