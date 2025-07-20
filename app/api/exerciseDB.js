import { rapidApiKey } from "../constants";

const baseUrl = 'https://exercisedb.p.rapidapi.com';

const apiCall = async (URL, params) => {
    try{
        const options = {
            method: 'GET',
            url: URL,
            params: params,
            headers: {
                'x-rapidapi-key': rapidApiKey,
                'x-rapidapi-host': 'exercisedb.p.rapidapi.com'
            }
        };
        const response = await axios.request(options);
        return response.data;
    }
    catch(e){
        console.error('error:', e);
    }
};

export const fetchExercisesByBodyPart = async (bodyPart) => {
    let data = await apiCall(baseUrl + `/exercises/bodyPart/${bodyPart}`);
    return data;
}