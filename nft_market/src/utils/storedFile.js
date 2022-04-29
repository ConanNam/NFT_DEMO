
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js'

const client = new Web3Storage({ token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDg0YWY3NTFDMWE1MjVBOTJDQzBGNzA4NjJmMGVFNzYzNENGYzU3ODUiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDgwMDgzNDQ4MTIsIm5hbWUiOiJEZVN0b3JhZ2UifQ.tgGtTgcNvs7_0A_ehu7iGvY8VlaOcJgBrOS1zzFCnDg" })
import {message} from 'antd'


export const storedFile = async (files) => {

    const rootCid = await client.put(files);
    const info = await client.status(rootCid);
    console.log("🚀 ~ file: storedFile.js ~ line 9 ~ storedFile ~ info", info)

    return rootCid;
}

export const fetchFile = async (cid, isPreview) => {
    message.loading('Loading...',300)
    const res = await client.get(cid);
    const files = await res.files();
    const url = `https://${cid}.ipfs.dweb.link/${files[0].name}`
    console.log("🚀 ~ file: storedFile.js ~ line 20 ~ fetchFile ~ url", url)
    const url_blob = window.URL.createObjectURL(new Blob(files))
    if(files){
        message.destroy()
    }
    if (isPreview) {
        window.open(url)
    } else {
        let a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        a.href = url_blob;
        a.download = files[0].name;
        a.click();
        window.URL.revokeObjectURL(url);
    }

}

export const type_file = (type) => {
    switch (type) {
        case "application/pdf":
            return require('../assets/pdf.png')
        case "video/mp4":
            return require('../assets/mp4.png')
        case "image/png":
            return require('../assets/image.png')
        case "image/jpeg":
            return require('../assets/image.png')
        case "audio/mpeg":
            return require('../assets/mp3.png')
        default:
            return require('../assets/document.png')
    }
}
