import * as awsx from "@pulumi/awsx";

  const tags = {
    owner: "piers",
  };

  const nlb = new awsx.lb.NetworkLoadBalancer("nlb", {
    tags: {
      ...tags,
      Name: "piers-nlb",
    }
  });

  const listener_8080 = nlb.createListener("nlb-listener-8080", {
    port: 8080,
    
  });

  const listener_8081 = nlb.createListener("nlb-listener-8081", {
    port: 8081,
    
  });

  const cluster = new awsx.ecs.Cluster("pk-cluster", {
    tags: {
      ...tags,
      Name: "pk-cluster",
    },
  });

  const image = awsx.ecs.Image.fromPath("multiport", "./app");

  const service = new awsx.ecs.FargateService("eventstore-service", {
    cluster: cluster,
    platformVersion: "1.4.0",
    taskDefinitionArgs: {
      containers: {
        app: {
          image: image,
          portMappings: [listener_8080, listener_8081],
        },
      },
    },
    desiredCount: 1,
  },
  {
      transformations: [
          (args) => {
            if (args.type === "aws:ecs/taskDefinition:TaskDefinition") {
                args.props.containerDefinitions.apply((x: any) => console.log(x))
            }
            return {
                props: args.props,
                opts: args.opts
            }
          }
      ]
  });

  export const nlbUrl = nlb.loadBalancer.dnsName;
