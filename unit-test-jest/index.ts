import * as pulumi from "@pulumi/pulumi";
import * as random from "@pulumi/random";

export const pw = new random.RandomPassword("pw", {
    length: 20
});

