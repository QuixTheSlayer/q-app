import { RootState, useAppDispatch } from "@/store"
import { closeModal } from "@/store/global.slice"
import { Loader2 } from "lucide-react"
import { useSelector } from "react-redux"

export default function ConfirmModal() {

    const { isConfirmModalOpen, confirmModalData,isLoading } = useSelector((state: RootState) => state.globalState)
    const dispatch = useAppDispatch()

    if (isConfirmModalOpen)
        return (
            <div onClick={() => {
                // dispatch(closeModal())

            }} className=" flex justify-center items-start fixed z-[9999999999] w-screen h-screen bg-[#23232370] backdrop-blur-sm " >
                <div className=" confirmBox mt-[50px]  w-[450px] h-[250px] flex flex-col p-3 bg-popover rounded-lg " >
                    <div className=" font-semibold text-lg pb-3 border-b h-[40px] w-full flex items-center " >
                        {confirmModalData.title}
                    </div>

                    <div className=" flex flex-col gap-5 justify-center h-full items-center 
                    " >

                        <p>
                            {confirmModalData.description}
                        </p>

                        <div className=" w-[70%] flex justify-between items-center " >
                            <div style={{
                                opacity:isLoading ? 0.5:1,
                                cursor: isLoading ? 'wait':'pointer'
                            }} onClick={()=>{
                            !isLoading &&   confirmModalData.onCancel && confirmModalData.onCancel()
                            }} className=" w-[45%] rounded-xl h-[48px] border text-muted-foreground cursor-pointer  font-medium   flex justify-center items-center " >
                                Cancel
                            </div>
                            <div style={{
                                opacity:isLoading ? 0.5:1,
                                cursor: isLoading ? 'wait':'pointer'
                            }} onClick={()=>{
                             !isLoading &&  confirmModalData.onSubmit && confirmModalData.onSubmit()
                            }} className=" w-[45%] rounded-xl h-[48px] border gap-2 bg-primary text-primary-foreground font-medium cursor-pointer  flex justify-center items-center " >
                                  Confirm   { isLoading && <div className=" animate-spin " > <Loader2 size={12} /> </div>}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        )
}