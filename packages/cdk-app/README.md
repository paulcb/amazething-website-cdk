# aMazeThing

CDK application for hosting a website that reads maze json files to render and solve


Devel CLI helper tests
```
# Get cloudfront dist id and invalidate cache to see updates
aws cloudfront list-distributions | grep "\"Id\":"
grep "\"Id\":" cdk.out/AmazethingStack-devel.template.json
aws cloudfront create-invalidation --distribution-id <id> --paths "/*"

# Find function name and invoke

aws lambda invoke \
    --function-name <bucket name> \
    --cli-binary-format raw-in-base64-out \
    response.json

grep "\"BucketName\":" cdk.out/AmazethingStack-devel.template.json
```
