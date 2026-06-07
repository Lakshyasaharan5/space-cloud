```
npm install
npm run dev
```

```
open http://localhost:3000
```

run the file

```
# start server
npm run dev

# qdrant storage
docker run -p 6333:6333 -p 6334:6334 \
    -v "$(pwd)/qdrant_storage:/qdrant/storage:z" \
    qdrant/qdrant
```
