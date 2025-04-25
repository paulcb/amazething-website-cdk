import { PutObjectRequest, S3, GetObjectCommand, S3ServiceException, NoSuchKey } from "@aws-sdk/client-s3";
import { S3Event } from "aws-lambda";
import { Readable } from "stream";

//TODO: is there a better way to do this. Make a package?
import { addMaze, MazesJson } from "./mazeJsonHelpers";

export const handler = async (event: S3Event): Promise<any> => {
    const bucketName = process.env.bucketName || '';
    const s3 = new S3();
    const mazeObjectKey = "mazes.json";
    let mazesJson = null;

    try {
        const getObjectParams = {
            Bucket: bucketName,
            Key: mazeObjectKey
        };

        const command = new GetObjectCommand(getObjectParams);
        const response = await s3.send(command);
        let bucketBody = null;
        if (response.Body) {
            bucketBody = await response.Body.transformToString();
            mazesJson = JSON.parse(bucketBody) as MazesJson;
        }
    } catch (error) {
        // If NoSuchKey occurs then Bucket has been cleared or redeployed then continue and Put first maze.
        if (!(error instanceof NoSuchKey)) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: error,
                }),
            };
        }
    }

    try {
        mazesJson = addMaze(mazesJson);
        mazesJson = JSON.stringify(mazesJson);
        const params: PutObjectRequest = {
            Bucket: bucketName,
            Key: "mazes.json",
            Body: Readable.from(mazesJson),
            ContentLength: mazesJson.length

        };
        await s3.putObject(params);
    } catch (error) {

        // place holders if errors are handled more in depth later
        // if (error instanceof Error) {
        //     console.log(error.message);
        // }
        // else if (error instanceof S3ServiceException) {
        //     const s3exception = error as S3ServiceException;
        //     console.log(s3exception.message);
        // }
        // else {
        //     console.log(error);
        // }
        
        // print error to console for tracing
        console.log(error);
        //send error message in the lambda return
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: error,
            }),
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Maze generation lambda ran to completion.",
        }),
    };

};