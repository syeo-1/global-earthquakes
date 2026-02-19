# global earthquake tracking

- a web project to learn more about web development, cloud, data, and GIS
- this aim of this project is to provide a performant and user friendly way to visualize earthquakes
that have occured globally within the last 30 days based on USGS earthquake data.

## tech stack
- javascript for user interface development (leaflet maps)
- AWS for automated data retrieval and storage (lambda, S3)
- python and GeoJSON for data retrieval (requests, plotly initially)
- github pages (for public access)

## Systems Design

![High Level System Design Diagram](./Earthquakes_architecture.png)

### What I learned about AWS

#### setting up static site retrieval and domain name

I decided I wanted a .dev domain and wanted to use AWS services to store data and the static web pages. AWS route53, its domain name service, does not cover .dev domains, so I purchased one from namecheap.
<br/>
<br/>
From there, I needed to learn how to serve static web content from AWS. A good solution seemed to be to use s3 buckets to store html/css/javascript files and then serve them to users. However, one issue
with this is that depending on the number of requests the bucket receives, using s3 to store the files could be expensive. This is where Cloudfront comes in. Cloudfront acts as a CDN for the requests so that
content can be viewed quickly across the globe (via caching), users cannot directly request the s3 contents, and in turn the files are secured and s3 files cannot be directly accessed, reducing or even getting rid of request costs
 (at least for smaller cases such as this website).
<br/>
<br/>
The next part is figuring out how to reroute a request on my domain to cloudfront on AWS while maintaining security. For this I had to create a hosted zone for my domain. By default, the hosted zone will create named servers (NS)
and SOA (Start of Authority) record type. From here, I added the 4 named servers to the nameservers list with the custom DNS option on my Namecheap domain management/settings (under Domain List). I then had to also configure security
for the website by creating an SSL/TLS certificate using AWS Certificate Manager. Upon generation, the certificate was added to the records of the hosted zone for my domain. Lastly, I set up the connection to cloudfront via Route53
by adding two A records for aliasing to the cloudfront URL. One for earthquakes.dev and one for www.earthquakes.dev. This was my first time setting up a website on AWS, so it was quite tedious, but in hindsight, I think it's good
information to know as a developer. Next I'll need to configure set up for updating the USGS earthquake data. This will be done using Eventbridge and Lambda.

#### setting up Lambda
In order to set up Lambda to use a Python function, I needed to first identify which libraries/packages I had to use for my function that would require (pip) installation. These
included requests and boto3. Luckily, since I'm running the function on AWS, boto3 is available by default, so no import is actually necessary for that. As for the requests library I had to do a couple extra steps. I had to
create a zip with the requests library by doing:
```
pip install requests -t <package_name>
```
then, I had to zip the created package_name folder and upload it to my lambda function
<br/>
I also had to include the following line in the Python file I wanted to use to use my package from my uploaded zip file:
```
sys.path.append(os.path.join(os.path.dirname(__file__), "package_name"))
```
and lastly, I had to add a function called lambda_handler in my file, which is AWS Lambda's entry point (ie. a main function) when using your lambda function/file.
On starting up, Lambda will invoke the handler function
```
def lambda_handler(event, context):
    try:
        s3_connection_and_test()
    except Exception as e:
        print(e)
        raise e
```
After this, I had to configure permissions to also allow putObject permissions for my Lambda function so that I would be able to update files within a designated
S3 bucket. To do this for my Lambda function, I had to go to the IAM service, look for the service role associated with my Lambda function (this role will be created
by default and have a naming convention with the lambda name inside plus an ID value). Click on Add Permissions, create an inline policy, and add the following
```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::your_bucket_name/*"
    }
  ]
}

```
and save. The service role for your lambda should now be updated to be able to edit objects in the designated bucket. Adjust the action as necessary.
<br/>
Within Lambda's code editor, you can also add a test to invoke the function manually for adhoc testing. You'll need to deploy code changes before invoking.

#### setting up Eventbridge

After all the set up for lambda and permissions with S3, Eventbridge should be relatively more straight forward. Go to Amazon Eventbridge service and create an Eventbridge schedule.
At the time of writing, it'll be a checkbox/radio input on the right side initially bringing up the service.
<br/>
For me, I'm using a Recurring, and Rate Based schedule. Choose other time/schedule related inputs that fit project needs. Then for the target
in the next step, choose Lambda. Choose the function you created previously as your target. Update other fields as necessary. In my case, defaults were
okay. Lastly, you can hit the create schedue button.
<br/>
<br/>
As a last step, verify on your lambda function that there is an event bridge trigger now associated with your function