import {Logger} from "@aws-lambda-powertools/logger";

const logger = new Logger({serviceName: "lambda1"});

export const handler = async () => {
    logger.info("Lambda1 started");
    return "Here be dragons";
}