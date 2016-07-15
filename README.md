# The Hive Server
## Profile

### Creando Perfil
Descripcion
(http://localhost:3000/api/profile/create)
```
first_name
last_name
email
password
phone
```
#### Retorno
```
{
    "status": "success",
    "message": "Success",
    "data": {
        "token": "57890cb9f9d2dd290401dd18",
        "profile": {
            "qrcode": "57890cb9f9d2dd290401dd16.png",
            "__v": 0,
            "updatedAt": "2016-07-15T16:18:01.605Z",
            "createdAt": "2016-07-15T16:18:01.600Z",
            "first_name": "Yarull",
            "last_name": "Alvarez",
            "phone": "3221232233",
            "public_id": "57890cb9f9d2dd290401dd16",
            "user_id": "57890cb9f9d2dd290401dd17",
            "_id": "57890cb9f9d2dd290401dd1a",
            "info": [],
            "skills": [],
            "experiences": []
        }
    }
}
```

### Insertando Experience
Descripcion
(http://localhost:3000/api/profile/experience)
```
guid
type
company
job
speciality
sector
ocupation
```
#### Retorno
```
{
    "status": "success",
    "message": "Success",
    "data": {
        "profile": {
            "id": "57890cb9f9d2dd290401dd1a",
            "first_name": "Yarull",
            "last_name": "Alvarez",
            "public_id": "57890cb9f9d2dd290401dd16",
            "skills": [],
            "experiences": [
                {
                    "ocupation_name": "Developer",
                    "company_name": "Axovia",
                    "sector_name": "Marketing",
                    "_id": "57891497f5ca4c5c053bd729"
                }
            ],
            "speciality": {
                "id": "57890e02f9d2dd290401dd20",
                "name": "ScrumMaster"
            }
        },
        "experiences": [
            {
                "_id": "57891497f5ca4c5c053bd728",
                "updatedAt": "2016-07-15T16:51:35.108Z",
                "createdAt": "2016-07-15T16:51:35.108Z",
                "profile_id": "57890cb9f9d2dd290401dd1a",
                "__v": 0,
                "sector": {
                    "name": "Marketing",
                    "id": "57891388b105112e05bbd5ba"
                },
                "company": {
                    "name": "Axovia",
                    "id": "578912327db486f5044a6d57"
                },
                "ocupation": {
                    "name": "Developer",
                    "id": "578912327db486f5044a6d58"
                }
            }
        ]
    }
}
```
### Cambiando Profilepic
Descripcion
(http://localhost:3000/api/profile/setprofilepic)
```
guid
profilepic
```
#### Retorno
```
{
    "status": "success",
    "message": "Success",
    "data": {
        "id": "57890cb9f9d2dd290401dd1a",
        "first_name": "Yarull",
        "last_name": "Alvarez",
        "public_id": "57890cb9f9d2dd290401dd16",
        "skills": [],
        "experiences": [
            {
                "ocupation_name": "Developer",
                "company_name": "Axovia",
                "sector_name": "Marketing",
                "_id": "57891497f5ca4c5c053bd729"
            }
        ],
        "profile_pic": "57890cb9f9d2dd290401dd1a.png",
        "speciality": {
            "id": "57890e02f9d2dd290401dd20",
            "name": "ScrumMaster"
        }
    }
}
```



## Network

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