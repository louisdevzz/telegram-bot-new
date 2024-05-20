import "./styles.module.css"
export default function Home(){
    return(
        <div className="w-full min-h-screen bg-[#180E35]">
            <div className="">
                {/* Top Header */}
                <div className="flex w-full items-center bg-[#180E35] py-5 px-4 border-b border-[#20114f] justify-center sticky top-0 z-50">
                    <h1 className="text-xl text-center text-[#bdbdbd]">huunhanz.near</h1>
                </div>
                {/* Container Top */}
                <div className="relative">
                    <div className="flex items-center overflow-y-scroll scroll-smooth flex-col mt-5 justify-center">
                        <div className="text-center flex flex-row gap-2 items-center">
                            <span className="text-sm text-[#716D9C]">Available Balance</span>
                            <img src="./images/svg/info.svg"/>
                        </div>
                        <div className="text-center mt-1">
                            <h2 className="text-[60px] text-white font-semibold">$100, 000</h2>
                        </div>
                        <div className="mt-5">
                            <ul className="flex flex-row text-[#f2f1ff95] justify-between items-center gap-7">
                                <li className="flex flex-col gap-3 justify-center items-center">
                                    <div className="relative">
                                        <img src="/images/svg/background_icon.svg" alt="icon" />
                                        <img width={20} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" src="/images/svg/home.svg" alt="icon" />
                                    </div>
                                    <a href="/wallet/send">Send</a>
                                </li>
                                <li className="flex flex-col gap-3 justify-center items-center">
                                    <div className="relative">
                                        <img src="/images/svg/background_icon.svg" alt="icon" />
                                        <img width={20}  src="/images/svg/add.svg" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" alt="icon" />
                                    </div>
                                    <a href="/wallet/mint">Mint NFT</a>
                                </li>
                                <li className="flex flex-col gap-3 justify-center items-center">
                                    <div className="relative">
                                        <img src="/images/svg/background_icon.svg" alt="icon" />
                                        <img width={20} src="/images/svg/x.svg" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" alt="icon" />
                                    </div>
                                    <a href="/wallet/vibe">Vibe</a>
                                </li>
                                <li className="flex flex-col gap-3 justify-center items-center">
                                    <div className="relative">
                                        <img src="/images/svg/background_icon.svg" alt="icon" />
                                        <img width={20} src="/images/svg/post.svg" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" alt="icon" />
                                    </div>
                                    <a href="/social/post">Post</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    {/* Container Top */}
                    <div className="mt-5">
                        <div className="mt-3 px-4 py-2">
                            <div className="flex flex-row justify-between items-center">
                                <label className="text-lg text-[#716D9C]">My Assets</label>
                                <img width={20} src="/images/svg/redo.svg" alt="icon_loading" />
                            </div>
                            <div className="h-[13vh] flex flex-row justify-between items-center px-5 mt-3 rounded-lg w-full bg-[#2f2649]">
                                <div className="flex flex-row gap-3">
                                    <img src="/images/logo/icon_near.svg" width={45} alt="logo" />
                                    <div className="flex flex-col justify-between items-start">
                                        <p className="text-[#716D9C]">NEAR</p>
                                        <small className="text-[#1d5cb0]">39.9 NEAR</small>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between">
                                    <p className="text-white">$88.70</p>
                                    <div className="flex flex-row gap-1.5">
                                        <img src="/images/icon/icon_up.svg" alt="icon"/>
                                        <small className="text-[#26a269]">8.7%</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-2 px-4 py-2">
                            <div className="flex flex-row justify-between items-center">
                                <label className="text-lg text-[#716D9C]">My Assets</label>
                                <div className="flex flex-row gap-2">
                                    <label className="text-[#b5afff]">Total NFTs</label>
                                    <p className="text-[#b6afff78]">8</p>
                                    <img width={20} src="/images/svg/redo.svg" alt="icon_loading" />
                                </div>
                            </div>
                            <div className="mt-3 flex flex-row gap-5 w-full">
                                <div className="flex flex-col items-start">
                                    <img width={110} src="/images/svg/card.svg" alt="NFT"/>
                                    <div className="px-1 py-2">
                                        <label className="mt-2 text-[#b5afff]">Title NFT</label>
                                        <p className="text-[#b5afff]">1</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start">
                                    <img width={110} src="/images/svg/card.svg" alt="NFT"/>
                                    <div className="px-1 py-2">
                                        <label className="mt-2 text-[#b5afff]">Title NFT</label>
                                        <p className="text-[#b5afff]">1</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start">
                                    <img width={110} src="/images/svg/card.svg" alt="NFT"/>
                                    <div className="px-1 py-2">
                                        <label className="mt-2 text-[#b5afff]">Title NFT</label>
                                        <p className="text-[#b5afff]">1</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Footer */}
                <div className="bg-[#241a3f] px-5 flex flex-row justify-between items-center h-[10vh] sticky z-50 bottom-0">
                    <a href="/">
                        <img width={35} src="/images/logo/logo.svg" alt="icon" />
                    </a>
                    <a href="/wallet/nfts">
                    <svg stroke="currentColor" fill="#b5afff" stroke-width="0" viewBox="0 0 24 24" focusable="false" className="chakra-icon css-xfmezh" height={30} width={30} xmlns="http://www.w3.org/2000/svg"><g><path fill="none" d="M0 0h24v24H0z"></path><path d="M7 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0 10a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm10-10a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0 10a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"></path></g></svg>
                    </a>
                    <a href="/wallet/history">
                        <svg fill="#b5afff"  height="28px" width="28px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg" stroke="#b5afff" stroke-width="1.056"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M18.605 2.022v0zM18.605 2.022l-2.256 11.856 8.174 0.027-11.127 16.072 2.257-13.043-8.174-0.029zM18.606 0.023c-0.054 0-0.108 0.002-0.161 0.006-0.353 0.028-0.587 0.147-0.864 0.333-0.154 0.102-0.295 0.228-0.419 0.373-0.037 0.043-0.071 0.088-0.103 0.134l-11.207 14.832c-0.442 0.607-0.508 1.407-0.168 2.076s1.026 1.093 1.779 1.099l5.773 0.042-1.815 10.694c-0.172 0.919 0.318 1.835 1.18 2.204 0.257 0.11 0.527 0.163 0.793 0.163 0.629 0 1.145-0.294 1.533-0.825l11.22-16.072c0.442-0.607 0.507-1.408 0.168-2.076-0.34-0.669-1.026-1.093-1.779-1.098l-5.773-0.010 1.796-9.402c0.038-0.151 0.057-0.308 0.057-0.47 0-1.082-0.861-1.964-1.939-1.999-0.024-0.001-0.047-0.001-0.071-0.001v0z"></path> </g></svg>
                    </a>
                    <a href="wallet/setting">
                        <svg fill="#b5afff" height="26px" width="26px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54.00 54.00" stroke="#b5afff" stroke-width="1.782"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M51.22,21h-5.052c-0.812,0-1.481-0.447-1.792-1.197s-0.153-1.54,0.42-2.114l3.572-3.571 c0.525-0.525,0.814-1.224,0.814-1.966c0-0.743-0.289-1.441-0.814-1.967l-4.553-4.553c-1.05-1.05-2.881-1.052-3.933,0l-3.571,3.571 c-0.574,0.573-1.366,0.733-2.114,0.421C33.447,9.313,33,8.644,33,7.832V2.78C33,1.247,31.753,0,30.22,0H23.78 C22.247,0,21,1.247,21,2.78v5.052c0,0.812-0.447,1.481-1.197,1.792c-0.748,0.313-1.54,0.152-2.114-0.421l-3.571-3.571 c-1.052-1.052-2.883-1.05-3.933,0l-4.553,4.553c-0.525,0.525-0.814,1.224-0.814,1.967c0,0.742,0.289,1.44,0.814,1.966l3.572,3.571 c0.573,0.574,0.73,1.364,0.42,2.114S8.644,21,7.832,21H2.78C1.247,21,0,22.247,0,23.78v6.439C0,31.753,1.247,33,2.78,33h5.052 c0.812,0,1.481,0.447,1.792,1.197s0.153,1.54-0.42,2.114l-3.572,3.571c-0.525,0.525-0.814,1.224-0.814,1.966 c0,0.743,0.289,1.441,0.814,1.967l4.553,4.553c1.051,1.051,2.881,1.053,3.933,0l3.571-3.572c0.574-0.573,1.363-0.731,2.114-0.42 c0.75,0.311,1.197,0.98,1.197,1.792v5.052c0,1.533,1.247,2.78,2.78,2.78h6.439c1.533,0,2.78-1.247,2.78-2.78v-5.052 c0-0.812,0.447-1.481,1.197-1.792c0.751-0.312,1.54-0.153,2.114,0.42l3.571,3.572c1.052,1.052,2.883,1.05,3.933,0l4.553-4.553 c0.525-0.525,0.814-1.224,0.814-1.967c0-0.742-0.289-1.44-0.814-1.966l-3.572-3.571c-0.573-0.574-0.73-1.364-0.42-2.114 S45.356,33,46.168,33h5.052c1.533,0,2.78-1.247,2.78-2.78V23.78C54,22.247,52.753,21,51.22,21z M52,30.22 C52,30.65,51.65,31,51.22,31h-5.052c-1.624,0-3.019,0.932-3.64,2.432c-0.622,1.5-0.295,3.146,0.854,4.294l3.572,3.571 c0.305,0.305,0.305,0.8,0,1.104l-4.553,4.553c-0.304,0.304-0.799,0.306-1.104,0l-3.571-3.572c-1.149-1.149-2.794-1.474-4.294-0.854 c-1.5,0.621-2.432,2.016-2.432,3.64v5.052C31,51.65,30.65,52,30.22,52H23.78C23.35,52,23,51.65,23,51.22v-5.052 c0-1.624-0.932-3.019-2.432-3.64c-0.503-0.209-1.021-0.311-1.533-0.311c-1.014,0-1.997,0.4-2.761,1.164l-3.571,3.572 c-0.306,0.306-0.801,0.304-1.104,0l-4.553-4.553c-0.305-0.305-0.305-0.8,0-1.104l3.572-3.571c1.148-1.148,1.476-2.794,0.854-4.294 C10.851,31.932,9.456,31,7.832,31H2.78C2.35,31,2,30.65,2,30.22V23.78C2,23.35,2.35,23,2.78,23h5.052 c1.624,0,3.019-0.932,3.64-2.432c0.622-1.5,0.295-3.146-0.854-4.294l-3.572-3.571c-0.305-0.305-0.305-0.8,0-1.104l4.553-4.553 c0.304-0.305,0.799-0.305,1.104,0l3.571,3.571c1.147,1.147,2.792,1.476,4.294,0.854C22.068,10.851,23,9.456,23,7.832V2.78 C23,2.35,23.35,2,23.78,2h6.439C30.65,2,31,2.35,31,2.78v5.052c0,1.624,0.932,3.019,2.432,3.64 c1.502,0.622,3.146,0.294,4.294-0.854l3.571-3.571c0.306-0.305,0.801-0.305,1.104,0l4.553,4.553c0.305,0.305,0.305,0.8,0,1.104 l-3.572,3.571c-1.148,1.148-1.476,2.794-0.854,4.294c0.621,1.5,2.016,2.432,3.64,2.432h5.052C51.65,23,52,23.35,52,23.78V30.22z"></path> <path d="M27,18c-4.963,0-9,4.037-9,9s4.037,9,9,9s9-4.037,9-9S31.963,18,27,18z M27,34c-3.859,0-7-3.141-7-7s3.141-7,7-7 s7,3.141,7,7S30.859,34,27,34z"></path> </g> </g></svg>
                    </a>    
                </div>
            </div>
        </div>
    )
}



