import axios from 'axios';
import api from './api';


export const API_URL = 'http://localhost:5000/api/auth/';

export const Login =(email, password) => {
    return axios.post(API_URL + 'login', {
        email,
        password
    }).then(response => {
        return response.data;
    });
};

export const ChangePassword =(old_password, new_password) => {
    return api.put('/auth/change-password', {
        old_password,
        new_password
    }).then(response => {
        return response.data;
    });
};


