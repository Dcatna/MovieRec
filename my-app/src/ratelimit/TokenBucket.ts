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


/**
 * A token bucket is used for rate limiting access to a portion of code.
 *
 * @see [Token Bucket on Wikipedia](http://en.wikipedia.org/wiki/Token_bucket)
 *
 * @see [Leaky Bucket on Wikipedia](http://en.wikipedia.org/wiki/Leaky_bucket)
 */
export interface TokenBucket {
    /**
     * Returns the capacity of this token bucket.  This is the maximum number of tokens that the bucket can hold at
     * any one time.
     *
     * @return The capacity of the bucket.
     */
    capacity: number

    /**
     * Returns the current number of tokens in the bucket.  If the bucket is empty then this method will return 0.
     *
     * @return The current number of tokens in the bucket.
     */
    numTokens(): number

    /**
     * Returns the amount of time in the specified time unit until the next group of tokens can be added to the token
     * bucket.
     *
     * @see TokenBucket.RefillStrategy.getMillisUntilNextRefill
     * @return The amount of time until the next group of tokens can be added to the token bucket.
     */
    getMillisUntilNextRefill(): number

    /**
     * Attempt to consume a single token from the bucket.  If it was consumed then `true` is returned, otherwise
     * `false` is returned.
     *
     * @return `true` if a token was consumed, `false` otherwise.
     */
    tryConsume(): Promise<boolean>

    /**
     * Attempt to consume a specified number of tokens from the bucket.  If the tokens were consumed then `true`
     * is returned, otherwise `false` is returned.
     *
     * @param numTokens The number of tokens to consume from the bucket, must be a positive number.
     * @return `true` if the tokens were consumed, `false` otherwise.
     */
    tryConsumeAmount(numTokens: number): Promise<boolean>

    /**
     * Consume a single token from the bucket.  If no token is currently available then this method will block until a
     * token becomes available.
     */
    consume(): Promise<void>

    /**
     * Consumes multiple tokens from the bucket.  If enough tokens are not currently available then this method will block
     * until
     *
     * @param numTokens The number of tokens to consume from the bucket, must be a positive number.
     */
    consumeAmount(numTokens: number): Promise<void>

    /**
     * Refills the bucket with the specified number of tokens.  If the bucket is currently full or near capacity then
     * fewer than `numTokens` may be added.
     *
     * @param numTokens The number of tokens to add to the bucket.
     */
    refill(numTokens: number): void
}

/** Encapsulation of a strategy for relinquishing control of the CPU.  */
export interface SleepStrategy {
    /**
     * Sleep for a short period of time to allow other threads and system processes to execute.
     */
    sleep(): Promise<void>
}

/** Encapsulation of a refilling strategy for a token bucket.  */
export interface RefillStrategy {
    /**
     * Returns the number of tokens to add to the token bucket.
     *
     * @return The number of tokens to add to the token bucket.
     */
    refill(): number

    /**
     * Returns the amount of time in the specified time unit until the next group of tokens can be added to the token
     * bucket.  Please note, depending on the `SleepStrategy` used by the token bucket, tokens may not actually
     * be added until much after the returned duration.  If for some reason the implementation of
     * `RefillStrategy` doesn't support knowing when the next batch of tokens will be added, then an
     * `UnsupportedOperationException` may be thrown.  Lastly, if the duration until the next time tokens will
     * be added to the token bucket is less than a single unit of the passed in time unit then this method will
     * return 0.
     *
     * @return The amount of time in nanoseconds until the next group of tokens can be added to the token bucket.
     */
    getMillisUntilNextRefill(): number
}
