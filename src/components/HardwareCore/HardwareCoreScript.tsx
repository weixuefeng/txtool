import Script from 'next/script'

export default function HardwareCoreScript() {
    return (
        <>
            <Script src="/assets/js/wallet-hardware-lib.js" strategy='beforeInteractive' />
        </>
    )
}