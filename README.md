1 - crear backend
composer create-project laravel/laravel backend
cd backend
php artisan install:api

2 - borra 
vite.config.js
package.json
package-lock.json
carpeta resources/css o resources/js

3 - crear frontend react vite tailwind ts
npm create vite@latest frontend -- --template react-ts

INSTALAR TAILWIND Y DEPENDENCIAS
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

configurar el tailwind.config.js en  
content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],

4 - Conexión Frontend -> Backend

npm install axios
php artisan config:publish cors

php artisan tinker

App\Models\User::create([
    'name' => 'Admin',
    'email' => 'garabitoShopRD@gmail.com',
    'phone' => '8498810114',
    'password' => Hash::make('Garabito'),
    'role' => 'admin',
    'is_active' => true,
]);

sh
php artisan storage:link


sh
php artisan db:seed

php artisan migrate:fresh