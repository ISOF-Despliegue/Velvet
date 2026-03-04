# Velvet project
Autores:

Arturo Agustín Cuevas Pérez

Eugenio Salvador González Sánchez

Erickmel Vázquez López

# Despliegue con Docker

### Requisitos
Tener Docker instalado y corriendo en la computadora
### Construir la imagen
En la raíz del proyecto ejecuta el siguiente comando para empaquetar:
```bash
docker build -t velvet-api .
```

### Ejecutar el contenedor
Para levantar la API, mapear los puertos y pasar la configuración necesaria ejecuta:
```bash
docker run -d --name api-velvet -p 3000:3000 -e PORT=3000 velvet-api
```

### Variables de entorno  usadas
**PORT**: La usamos para indicarle al contenedor en qué puerto va a encender la API (usamos el puerto 3000), esta se inyecta desde afuera al momento de ejecutar el contenedor usando la bandera 
 ```bash
 -e PORT=3000
 ```

 ### Pruebas Rápidas
Una vez que ya se tiene el contenedor corriendo se puede interactuar con la API usando herramientas como POSTMAN (deberá de apuntar a http://localhost:3000/api/) o desde terminal usando curl (debe ser desde una terminal Git Bash):

**Para ver el historial guardado:**
```bash
curl -X GET http://localhost:3000/api/historial
```

**Para hacer un cálculo nuevo por lotes:**
```bash
curl -X POST http://localhost:3000/api/calcular-lotes -H "Content-Type: application/json" -d '{"operacion":"sumar", "numeros":[10, 20, 30]}'
```


