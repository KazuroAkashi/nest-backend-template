import { CACHE_MANAGER, Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import * as TO from "fp-ts/TaskOption";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { flow } from "fp-ts/function";

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

    cached<P, R, E>(
        key: (p: P) => string,
        func: (p: P) => TE.TaskEither<E, R>,
    ): (p: P) => TE.TaskEither<E, R> {
        return (p: P) => async () => {
            const val = await this.cacheManager.get<R>(key(p));
            if (val) return E.right(val);
            else {
                const ret = await func(p)();
                // TODO: This should use Either
                if (ret._tag === "Right") {
                    await this.cacheManager.set(key(p), ret.right);
                }
                return ret;
            }
        };
    }

    // TODO: Invalidation
}
