# .env
Add variables to your .env taking example from .env-exp 

# install dependancies
npm i

# Start docker-compose
```bash
docker-compose up -d 
```

# Create mongo user
The user has to be the same as your MONGO_USER that you've added in .env
The pwd has to be the same as MONGO_PASSWORD of your .env
The db must also be the same as MONGO_DB of your .env
 
```bash
> mongo -u root -p root
> use keen-eye
> db.createUser({
  user: "keen-eye",
  pwd: "keen-eye",
  roles: [
    { role: "readWrite", db: "keen-eye" }
  ]
});
```
# Start application
nest start dev 
