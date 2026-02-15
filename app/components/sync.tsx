"use client"
import { useLocalStorage } from "usehooks-ts";
import { useEffect, useState } from "react";
import { exportData, importData } from "@/data/backupUtils";
import { API_KEY, VERSIONS_STAMP } from "../types";

type Props = {
    overwriteData: Function;
    data: any;
    name: string;
}

type Message = {
    show: boolean;
    error: boolean;
    message: string;
}

const URL = 'local-sync/';

const Sync = (props: Props) => {

    const [mounted, setMounted] = useState(false);
    const [versionstamp, setVersionstamp] = useLocalStorage(VERSIONS_STAMP, 0);
    const [token, setToken] = useLocalStorage(API_KEY, "");
    const [message, setMessage] = useState({ show: false, error: false, message: "" } as Message)

    let blocked = false;

    useEffect(() => {
        setMounted(true);
    }, []);

    const startTimer = () => {
        setTimeout(() => {
            message.show = false;
            setMessage(message);
        }, 3000)
    }

    const toast = {
        error: (message: string) => {
            setMessage({ show: true, error: true, message });
            startTimer();
        },
        info: (message: string) => {
            setMessage({ show: true, error: false, message });
            startTimer();
        }
    }

    const getData = async () => {
        const requestOptions = {
            method: "GET",
            headers: { "Content-Type": "application/json", "X-API-KEY": token },
        };
        const response = await fetch(URL, requestOptions);
        if (response.status != 200) {
            // toast.error('Failed to Sync data', toastErrorOptions);
            toast.error('Failed to Sync data');
            return;
        }
        try {
            const data = await response.json();
            return data;;
        } catch (err) {
            console.error('Cannot parse data', err);
            toast.error("Sync failed - parsing problem");
        }
    }

    const load = async () => {
        if (blocked) {
            console.warn('Re-click load - blocked');
        }
        block();
        const data = await getData();
        if (!data) {
            toast.error('Sync has no data?');
            return;
        }
        setVersionstamp(data.versionstamp);
        const ok = props.overwriteData(data);
        if (ok) {
            toast.info("Sync'd up!");
        } else {
            toast.error("No data coming back from sync")
        }
        release();
    }

    const checkVersion = async () => {
        if (versionstamp == 0) {
            return;
        }
        const data = await getData();
        if (data.versionstamp != versionstamp) {
            toast.error('Cannot Send - out of sync');
            throw Error("Out of sync");
        }
    }

    const save = async () => {
        if (blocked) {
            console.warn('Re-click save - blocked');
            return;
        }
        block();
        checkVersion();
        const data = {
            token,
            data: props.data
        };

        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-API-KEY": token },
            body: JSON.stringify(data),
        };
        const response = await fetch(URL, requestOptions);
        if (response.status != 200) {
            toast.error("Cannot send sync! : " + response.status);
            return;
        }
        try {
            const backData = await response.json();
            const vs = backData.versionstamp;
            setVersionstamp(vs);
            toast.info("Sync sent and saved");
            console.log(backData)
        } catch (er: unknown) {
            toast.error("Cannot understand returned data : " + er);
            console.error(er);
            console.error(response);
        }
        release();
    }

    const hasToken = token != '';
    const noToken = !hasToken;

    const updateToken = () => {
        const el = document.getElementById("token-input") as HTMLInputElement;
        setToken(el.value);
    }

    const clearToken = () => {
        setToken("");
    }

    const block = () => {
        (document.getElementById("load-butt") as HTMLButtonElement).disabled = true;
        (document.getElementById("save-butt") as HTMLButtonElement).disabled = true;
        (document.getElementById("clear-butt") as HTMLButtonElement).disabled = true;
        blocked = true;
    }

    const release = () => {
        (document.getElementById("load-butt") as HTMLButtonElement).disabled = false;
        (document.getElementById("save-butt") as HTMLButtonElement).disabled = false;
        (document.getElementById("clear-butt") as HTMLButtonElement).disabled = false;
        blocked = false;
    }

    const download = () => {
        exportData(props.name, props.data);
    }

    const upload = () => {
        importData(props.overwriteData);
    }

    return (
        <div className="w-11/12">
            {mounted && noToken && <div>
                <input id="token-input" autoFocus className="w-11/12 p-2 mb-2 ml-4 rounded-lg bg-sky-200 text-left" placeholder="Whats the token"></input><button className="ml-3 text-gray-500 bg-sky-200 hover:bg-blue-200 focus:outline-none focus:ring hover:pr-0 focus:ring-yellow-300  rounded-xl h-9 w-12 mt-3" onClick={updateToken}>post</button>
            </div>}
            {message.show &&
                <div className={message.error ? "text-red-500 m-3 p-2 text-center bg-slate-300 rounded-lg" : "text-blue-500 m-3 p-2 text-center bg-slate-300 rounded-lg"}>{message.message}
                </div>}

            {mounted && hasToken && !blocked && <div>
                <div className='grid grid-cols-5'>
                    <button id="load-butt" className="w-12 text-orange-500 hover:bg-blue-200 focus:outline-none focus:ring hover:pr-0 focus:ring-yellow-300 text-2xl rounded-xl h-8 float-start" title="sync" onClick={load} >↻</button>
                    <button id="upload-butt" className="w-10 font-bold text-2xl text-yellow-100 hover:bg-blue-200 focus:outline-none focus:ring hover:pr-0 focus:ring-yellow-300 rounded-xl h-8 place-self-center" title="upload" onClick={upload} >↑</button>
                    <button id="clear-butt" className="w-12 text-red-500 hover:bg-blue-200 focus:outline-none focus:ring hover:pr-0 focus:ring-yellow-300 text-xl rounded-xl h-8 place-self-center" title="clear" onClick={clearToken} >🧹</button>
                    <button id="download-butt" className="w-10 text-2xl font-bold text-yellow-100 hover:bg-blue-200 focus:outline-none focus:ring hover:pr-0 focus:ring-yellow-300 rounded-xl h-8 place-self-center" title="download" onClick={download} >↓</button>
                    <button id="save-butt" className="w-12 text-green-600 hover:bg-blue-200 focus:outline-none focus:ring hover:pr-0 focus:ring-yellow-300 text-xl rounded-xl h-8 place-self-end" title="send" onClick={save} >➤</button>
                </div>
            </div>}
            <input type="file" hidden
                id="importData" name="importData"
                accept="application/json" onChange={() => importData(props.overwriteData)} />
        </div >
    )
}

export default Sync