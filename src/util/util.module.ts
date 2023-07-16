import { CacheModule, Module } from "@nestjs/common";
import { CacheService } from "./cache.service";

@Module({
    providers: [CacheService],
    exports: [CacheService],
})
export class UtilModule {}
