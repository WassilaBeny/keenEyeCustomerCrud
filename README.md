# .env
Add variables to your .env taking example from .env-exp 

# install dependancies
```bash
npm i
```

# Start docker-compose
```bash
docker-compose up -d 
```

# Create mongo user
1. The user has to be the same as your MONGO_USER that you've added in .env
2. The pwd has to be the same as MONGO_PASSWORD of your .env
3. The db must also be the same as MONGO_DB of your .env
 
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
```bash
nest start dev 
```

# Run tests
```bash
npm run test 
```