#  Privileged Access Management recertification VueJS frontend 

VueJS frontend UI written as part of my University dissertation. Together with the accompanying [API](https://github.com/annahowell/PAMrecert-API), it allows the projects stakeholders to recertify privileged access of employee roles.

At their request, the code and branding of this frontend has been anonymised to hide the identity of the stakeholder company.

## Installation

1. Run `npm install` from the root folder

1. Edit line 6 of `/src/store.js` such that it mirrors the location of the backend API, for example: `axios.defaults.baseURL = 'http://192.168.1.100:2000/api/v1/'`

2. Run `npm run build` from the root folder and then  point your http daemon at the resulting `/dist` folder.



## Screenshots 

##### (Obfuscation at stakeholders request)

### Admin pages

![Admin homepage](https://github.com/annahowell/PAMrecert-Frontend/blob/master/screenshots/admin1.png)

![Admin risk assessment](https://github.com/annahowell/PAMrecert-Frontend/blob/master/screenshots/admin2.png)

![Admin CSV report download](https://github.com/annahowell/PAMrecert-Frontend/blob/master/screenshots/admin3.png)

![Admin report download](https://github.com/annahowell/PAMrecert-Frontend/blob/master/screenshots/admin5.png)

### User pages

![User homepage](https://github.com/annahowell/PAMrecert-Frontend/blob/master/screenshots/user1.png)

![Role owner recertification](https://github.com/annahowell/PAMrecert-Frontend/blob/master/screenshots/user3.png)
