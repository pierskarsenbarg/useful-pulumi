using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Pulumi;
using Pulumi.Automation;

namespace csharp_automation
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var program   = PulumiFn.Create(() => {
                    var stack = new DefaultStack();
                    return new Dictionary<string, object> {{"Urn", "foobar"}};
                }
            );
            var stackArgs = new InlineProgramArgs("my-new-stack", "dev", program);
            using var appStack = await LocalWorkspace.CreateOrSelectStackAsync(stackArgs);
            Console.WriteLine("installing plugins...");
            await appStack.Workspace.InstallPluginAsync("aws", "v3.30.1");
            Console.WriteLine("plugins installed");

            // set stack configuration specifying the region to deploy
            Console.WriteLine("setting up config...");
            await appStack.SetConfigValueAsync("aws:region", new ConfigValue("us-west-2"));
            Console.WriteLine("config set");
            await appStack.UpAsync();
        }
    }
}
