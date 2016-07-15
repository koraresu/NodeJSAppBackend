# The Hive Server
## Profile

### Editando Perfil 
Al entrar a la seccion more, existe una seccion para modificar y agregar un segundo puesto/empresa
[Update-Experience](http://localhost:3000/api/profile/update-experience)
```
	guid = 574389ae2346af0a1fb6061e
	first_name
	last_name
	job
	speciality
	birthday
	type[0]
	ocupation[0]
	company[0]
	sector[0]
	type[1]
	ocupation[1]
	company[1]
	sector[1]
```

## Network
### Mandando Solicitud
Enviar solicitud de Conexion, 
(http://localhost:3000/api/network/connect)
```
guid 
public_id
```
#### Retorno
```
{
    "status": "success",
    "message": "Success",
    "data": {
        "accepted": false,
        "public_id": "57833a32bb45107f65f48c7a"
    }
}
```

### Aceptando Solicitud
Aceptando una solicitud enviada.
(http://localhost:3000/api/network/accept)
```
guid 
public_id
```
#### Retorno
```
{
    "status": "success",
    "message": "Success",
    "data": {
        "accepted": true,
        "public_id": "5782efffdd160bdc46a28b62"
    }
}
```

## Publish
### Escribir una Noticia
Descripcion
(http://localhost:3000/api/publish/write/news)
```
guid
title
content
gallery <- Array, Ejemplo: gallery[0], gallery[1]
```
#### Retorno
```
{
    "status": "success",
    "message": "Success",
    "data": {
        "id_n": 0,
        "id": "578874904e7dfa1705c115a1",
        "type": "1",
        "title": "Presentación en Grupo Vidanta",
        "content": "Tuvimos una excelente recepción este fin de semana.\\n\\nExpusimos nuestra dinámica de trabajo Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.\\n\\nNemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
        "gallery": [
            {
                "url": "HJt5ExIw.png"
            },
            {
                "url": "B1gF94eUD.png"
            },
            {
                "url": "BkZFc4gUv.png"
            },
            {
                "url": "S1zKqVeIw.png"
            }
        ],
        "profile": {
            "first_name": "Rael",
            "last_name": "Corrales",
            "public_id": "5782efffdd160bdc46a28b62",
            "skills": [],
            "experiences": [
                {
                    "ocupation_name": "Web Developer",
                    "company_name": "Axovia",
                    "sector_name": "Marketing",
                    "_id": "578320fed9257ca356a357d6"
                }
            ],
            "profile_pic": "5782efffdd160bdc46a28b66.png",
            "speciality": {
                "id": "5783142dd9257ca356a357cc",
                "name": "Fullstack Developer"
            }
        },
        "date": "2016-07-15T05:28:48.889Z"
    }
}
```

### Escribir Comentario (FeedBack)
Descripcion
(http://localhost:3000/api/publish/write/comentario)
```
guid
title
content
```
#### Retorno
```
{
    "status": "success",
    "message": "Success",
    "data": {
        "title": "Mal funcionamiento para iniciar sesión",
        "content": "Cada vez que abro la app me pide ingresar sesión, una vez que ingresó mis datos, me pide que pase un filtro de seguridad, nunca puedo pasar de ese filtro, me saca de la aplicación... Muy mal.",
        "date": "2016-07-15T05:32:20.315Z"
    }
}
```

### Obtener Noticias
Descripcion
(http://localhost:3000/api/publish/get/news)
```
guid
```
#### Retorno
```
{
    "status": "success",
    "message": "Success",
    "data": [
        {
            "id_n": 0,
            "id": "578874904e7dfa1705c115a1",
            "type": "1",
            "title": "Presentación en Grupo Vidanta",
            "content": "Tuvimos una excelente recepción este fin de semana.\\n\\nExpusimos nuestra dinámica de trabajo Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.\\n\\nNemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
            "gallery": [
                {
                    "url": "HJt5ExIw.png"
                },
                {
                    "url": "B1gF94eUD.png"
                },
                {
                    "url": "BkZFc4gUv.png"
                },
                {
                    "url": "S1zKqVeIw.png"
                }
            ],
            "profile": {
                "id": "5782efffdd160bdc46a28b66",
                "first_name": "Rael",
                "last_name": "Corrales",
                "public_id": "5782efffdd160bdc46a28b62",
                "skills": [],
                "experiences": [
                    {
                        "ocupation_name": "Web Developer",
                        "company_name": "Axovia",
                        "sector_name": "Marketing",
                        "_id": "578320fed9257ca356a357d6"
                    }
                ],
                "profile_pic": "5782efffdd160bdc46a28b66.png",
                "speciality": {
                    "id": "5783142dd9257ca356a357cc",
                    "name": "Fullstack Developer"
                }
            },
            "date": "2016-07-15T05:28:48.889Z"
        }
    ]
}
```

### Obtener Recomendaciones
Descripcion
(http://localhost:3000/api/publish/get/news)
```
guid
action <- Filtro (Numero de tipo de Noticia, Ejemplo: "1", "1,2,3", En el caso de las Recomendación usas "4")
```
#### Retorno
```
{
    "status": "success",
    "message": "Success",
    "data": [
        {
            "id_n": 2,
            "id": "57888195744f4d8d05c403f0",
            "type": "4",
            "busqueda": "PHP",
            "profile": {
                "id": "5782efffdd160bdc46a28b66",
                "first_name": "Rael",
                "last_name": "Corrales",
                "public_id": "5782efffdd160bdc46a28b62",
                "skills": [],
                "experiences": [
                    {
                        "ocupation_name": "Web Developer",
                        "company_name": "Axovia",
                        "sector_name": "Marketing",
                        "_id": "578320fed9257ca356a357d6"
                    }
                ],
                "profile_pic": "5782efffdd160bdc46a28b66.png",
                "speciality": {
                    "id": "5783142dd9257ca356a357cc",
                    "name": "Fullstack Developer"
                }
            },
            "profile_friend": {},
            "date": "2016-07-15T06:24:21.670Z"
        }
    ]
}
```

### Peticion de Recomendación
Descripcion
(http://localhost:3000/api/publish/write/recomendar)
```
guid
busqueda
```
#### Retorno
```
{
    "status": "success",
    "message": "Success",
    "data": {
        "id_n": 2,
        "id": "57888195744f4d8d05c403f0",
        "type": "4",
        "busqueda": "PHP",
        "profile": {
            "first_name": "Rael",
            "last_name": "Corrales",
            "public_id": "5782efffdd160bdc46a28b62",
            "skills": [],
            "experiences": [
                {
                    "ocupation_name": "Web Developer",
                    "company_name": "Axovia",
                    "sector_name": "Marketing",
                    "_id": "578320fed9257ca356a357d6"
                }
            ],
            "profile_pic": "5782efffdd160bdc46a28b66.png",
            "speciality": {
                "id": "5783142dd9257ca356a357cc",
                "name": "Fullstack Developer"
            }
        },
        "profile_friend": {},
        "date": "2016-07-15T06:24:21.670Z"
    }
}
```

### Recomendación
Descripcion
(http://localhost:3000/api/network/recomendar)
```
guid
public_id
history_id
```
#### Retorno
```
{
    "status": "success",
    "message": "Success",
    "data": {
        "profile_emisor": "5782efffdd160bdc46a28b62",
        "profile_mensaje": "57833a32bb45107f65f48c7a",
        "busqueda": "57888195744f4d8d05c403f0"
    }
}
```






### Titulo
Descripcion
(Direccion)
```
Parametros
```
#### Retorno
```
Retorno
```