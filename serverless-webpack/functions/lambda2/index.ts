import {Logger} from "@aws-lambda-powertools/logger";

const logger = new Logger({serviceName: "lambda1"});

export const handler = async () => {
    logger.info("Lambda2 started")
    return "Here be dragons"
}