import {Injectable} from '@angular/core';
import {Action} from '@ngrx/store';

@Injectable()
export class AuthActions {
    static USER_LOGIN = '[User] Login';
    userLogin(user): Action {
        return {
            type: AuthActions.USER_LOGIN,
            payload: user
        }
    }

    static USER_LOGIN_SUCCESS = '[User] Login success';
    userLoginSuccess(user): Action {
        return {
            type: AuthActions.USER_LOGIN_SUCCESS,
            payload: user
        }
    }


    static USER_LOGIN_FAILED = '[User] Login failed';
    userLoginFailed(user): Action {
        return {
            type: AuthActions.USER_LOGIN_FAILED,
            payload: user
        }
    }

    static USER_LOGOUT = '[User] Logout';
    userLogout(user): Action {
        return {
            type: AuthActions.USER_LOGOUT,
            payload: user
        }
    }

    static USER_LOGOUT_SUCCESS = '[User] Logout success';
    userLogoutSuccess(user): Action {
        return {
            type: AuthActions.USER_LOGOUT_SUCCESS,
            payload: user
        }
    }


    static USER_LOGOUT_FAILED = '[User] Logout failed';
    userLogoutFailed(user): Action {
        return {
            type: AuthActions.USER_LOGOUT_FAILED,
            payload: user
        }
    }



    static USER_SIGNUP = '[User] Signup';
    userSignup(user): Action {
        return {
            type: AuthActions.USER_SIGNUP,
            payload: user
        }
    }

    static USER_SIGNUP_SUCCESS = '[User] Signup success';
    userSignupSuccess(user): Action {
        return {
            type: AuthActions.USER_SIGNUP_SUCCESS,
            payload: user
        }
    }


    static USER_SIGNUP_FAILED = '[User] Signup failed';
    userSignupFailed(user): Action {
        return {
            type: AuthActions.USER_SIGNUP_FAILED,
            payload: user
        }
    }
}