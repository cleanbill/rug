/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites() {
        const rws = [
            {
                source: "/local-sync",
                destination: "https://mickcarter-slink-64.deno.dev/locals/",
            },
        ];
        console.log('Rewrites', rws);
        return rws;
    },
}

export default nextConfig;
