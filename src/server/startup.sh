echo "------------------------------------"
echo "Before Prisma Migrate"
while npx prisma migrate deploy ; [ $? -ne 0 ]; do
  echo "Retrying Prisma Migrate"
  sleep 5
done
echo "After Prisma Migrate"