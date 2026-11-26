import axios from "axios";

export function loadSignedUrl(url: string): HTMLImageElement {

    const image = new Image()

    image.onload = () => (image);
    image.src = url


    return image

}

export function loadUrl(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        const image = new Image();


        // image.onload = () => resolve(image);

        console.log(url, "url from loadUrl Func")

        image.src = url



        const key = new URL(image.src).pathname.slice(1).split('/').slice(1).join('/')

        const realUrl = `/landing-page-builder/genereate_signed_url?key=${(key)}`
        fetchImg(realUrl).then(async (data) => {


            const response = await fetch(data);
            const file = await response.blob();
            image.src = URL.createObjectURL(file)
            image.crossOrigin = 'anonymous';



        })

        image.onload = () => resolve(image);


    });
}

export const fetchImg = async (img: string) => {
    return await axios.post(img).then(({ data }) => {
        console.log(data.data.url)
        return (data?.data?.url)
    })
}