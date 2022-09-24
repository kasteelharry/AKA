import { SetLogout } from "../App/AppContainer";


/**
 * Performs a POST request to where the path links to. Converts it to JSON or rejects it with an error.
 * @param path the path of the POST request as a string
 * @param body the body of the request.
 * @returns A promise that resolves as JSON data if the request was performed correctly; if not it will reject the promise.
 */
function makePostRequest(path: string, body: object): Promise<any> {
    return new Promise((resolve, reject) => {
        fetch(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            credentials: 'include'
        }).then(res => {
            if (res.status === 403) {
                SetLogout();
                throw new Error();
            } else if (res.status !== 200) {
                throw new Error();
            } else {
                return res.json();
            }
        }).then(data => {

            resolve(data);
        }, (error) => {
            reject(error);
        })
    });
}


export default makePostRequest;