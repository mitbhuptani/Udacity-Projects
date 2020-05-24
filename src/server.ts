import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());
  
  app.get("/filteredimage", async ( req:express.Request , res:express.Response ) => {
    let { image_url } = req.query;

    if (!image_url) {
      res.status(400)
         .send('Please provide a valid image URL {{image_url}}')
    }
    else if (image_url) {
      if (/(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/i.test(image_url.toString())) {
        try {
          const responseImagePath:string = await filterImageFromURL(image_url);
          res.status(200)
             .sendFile(responseImagePath, () => deleteLocalFiles([responseImagePath]))
        } catch (error) {
          res.status(500)
             .send(`Error occured while processing the given image URL, ${error}`)
        }
      } 
      else {
        res.status(400)
           .send('It is an invalid URL. Please provide a valid image URL')
      }
    }
  })

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req:express.Request , res:express.Response ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();