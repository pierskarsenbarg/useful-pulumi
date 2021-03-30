using Pulumi;

namespace csharp_automation
{
    public class DefaultStack
    {
        public DefaultStack()
        {
            var bucket = new Pulumi.Aws.S3.Bucket("bucket");
        }
    }
}