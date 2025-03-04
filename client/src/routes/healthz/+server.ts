import type { RequestHandler } from './$types';

// client serves from a container and the lambda web
// adapter tests this /healthz route for 200 on init:
// https://github.com/awslabs/aws-lambda-web-adapter?tab=readme-ov-file#readiness-check
export const GET: RequestHandler = async () => {
  return new Response(null, {
    status: 200
  });
};
