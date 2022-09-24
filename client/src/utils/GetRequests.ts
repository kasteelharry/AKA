import { SetLogout } from "../App/AppContainer";


/**
 * This method performs a GET request to where-ever the path points to. It resolves the promise either
 * with a JSON response object or it will return with an error.
 * @param path the path to perform the GET request to as a string.
 * @returns a promise with the response from the server resolved as JSON or rejected with an error.
 */
function makeGetRequest(path: string): Promise<any> {
        return new Promise((resolve, reject) => {
            fetch(path, {
                credentials: 'include'
            })
            .then(res => {
                if (res.status === 403) {
                    SetLogout();
                } else if (res.status !== 200) {
                    throw new Error();
                } else {
                    return res.json();
                }
            })
            .then(result => {                
                resolve(result);
            }, (error) => {
                reject(error);
            })

        });
    }

export default makeGetRequest;