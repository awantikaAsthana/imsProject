import axios from 'axios';


export const API_URL = 'http://localhost:5000/api/auth/';

export const Login =(email, password) => {
    return axios.post(API_URL + 'login', {
        email,
        password
    }).then(response => {
        return response.data;
    });
};


