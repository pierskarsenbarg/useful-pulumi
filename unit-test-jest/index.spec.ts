import * as pulumi from "@pulumi/pulumi";
import "jest"

function promiseOf<T>(output: pulumi.Output<T>): Promise<T> {
    return new Promise(resolve => output.apply(resolve));
}

describe("Password test", () => {
    let infra: typeof import("./index");
    beforeAll(() => {
        pulumi.runtime.setMocks({
            newResource: (args: pulumi.runtime.MockResourceArgs): {id: string, state: any} => {
                return {
                    id: `${args.name}_id`,
                    state: args.inputs
                };
            },
            call: (args: pulumi.runtime.MockCallArgs) => {
                return args.inputs;
            }
        })
    });

    beforeEach(async () => {
        infra = await import("./index");
    });

    describe("password", () => {
        it("must have a length of at least 20", async () => {
            const pwLength = await promiseOf(infra.pw.length);
            expect(pwLength).toBeGreaterThanOrEqual(20);
        })
    })
});