# fundrick-chunker-svc

Chunk &amp; store files in s3.

TODO:

1. Endpoints -
   - create file -- send to s3 (see point 2 for what it shoudl do)
   - update file -- query indexer (url & hash, etc..) compoare hashes, and upodate s3 and after all done sned indexer new hashs and s3 urls.
   - delte file -- Delete from s3, let indxer know to cleanup tables.
2. S3 MultiPart Upload (eachurl back should give me a chunk).
   -> send hashses and s3 urls to sql (done with api after this.)
