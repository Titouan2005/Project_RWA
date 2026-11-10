# RWA_Project

## Assignment 1:

In this assignment, you are tasked with designing and developing a Product Management Web Application using Next.js and PocketBase.

As a proof of concept, ten different laptop models should be shown in the app.

The application will allow users to add, view, update, and delete laptops through a user-friendly web interface. Product information will be stored in a PocketBase database and accessed using API routes.

With this basic app, the focus then shifts to using caches and optimising app delivery to the user.  To ensure the developed solution is complete, a collection of AI-defined unit tests should also be created to test each page of the app with varying inputs.




## App functionality

Create a responsive website using Next.js that includes:

Home Page: An introduction to the application.
Products List Page: Display all products stored in the database.
Add Product Page: A form for adding new products.
Edit Product Page: Allow users to update existing products.
View Single Product Page: Display information about a selected product.



## Data storage

All product data should be persisted in the PocketBase database. Each record in the database should have the following attributes:

brand (Create 4 Dell, 4 Lenovo, and 2 Acer)
model
price
description



## Text Caching

To aid the delivery of text content on the app homepage, Redis should be used.  A Redis server can be obtained at https://redis.io for free.

Using this cache, all text on the app homepage should be stored in the Redis cache and called when the app loads the app homepage.


## Optimisation

To optimise delivery of the app to users, two different optimisation approaches should be implemented for the app (excluding Redis).

Pick any two optimisation approaches, and document how you implemented them.


## Testing

To test the developed web application, create a collection of Unit tests for the app.

Each test should be stored in the tests folder of the project. A test plan should first be created to outline what is being tested and the approach taken.

To automate the testing process, use an AI model to define different types of tests for the app. Ensure complete coverage of the app code.


When creating these tests for a page such as the add product page, we would create tests such as:

Check the add product page exists
Check we can add data into all the fields
Check we can submit the data.
Check the data exists in the database.
Check what happens when we enter different input strings into the fields on the page (long, short, numbers, strings, wildcards, strange characters, etc.)


## A-Grade Stats page

To get a higher mark, inside the app, add another page called /admin.

On this page, make a call to the database to get the list of all products. With this data, create a bar graph showing the quantity of each brand in stock.

After this, pick a different library and implement a line graph.

In your document, describe the core differences between the two graph types and how they are implemented.




## Deliverable

Once complete, upload a single PDF with the following headings:

Git- A link to the GitHub repository containing your project source code.

App screenshots- Screenshots of the completed application running in your browser.

Test and test output- A copy of the tests you created and output of each test.

Redis Cache- Screenshot of your Redis cache database and your app showing it working.

Database output - A screenshot of your product data in the database.

Optimisation implementation - Description of the two optimisations you chose and a description of how you did it.

A-grade Graph outputs - For the A-grade, capture screenshots of your two graph libraries showing the total amount of each laptop brand in stock.


## Demo

Once all your work has been submitted, you are required to demo your project and answer questions about how you implemented different aspects of the app

To prepare, ensure you understand everything you did and the rationale for each choice made.
