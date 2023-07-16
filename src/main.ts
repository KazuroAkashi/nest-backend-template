import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { execSync } from "child_process";

async function bootstrap() {
    execSync("sh migrate.sh");

    const app = await NestFactory.create(AppModule);
    //app.useGlobalPipes(new ValidationPipe());
    await app.listen(process.env.PORT || 3000);
}
bootstrap();
