
import EditorModal from '@/components/ui/components/Editor.modal'
import './index.css'
import { useModal } from '@/context/ModalContext'

const pageMap: Record<string, React.ComponentType> = {
  '/jtester/fieluploader': EditorModal,
}
function ImageEditorApp() {
  const { isOpen, openModal, updateModalProp, setModalType } = useModal()






  window.addEventListener("click", (ev) => {
    const target = (ev.target as HTMLDivElement)
    console.log(target)

    if ((target?.dataset['id'] || "").includes('event-uploader')) {
      updateModalProp({
        isOpen: true,
        title: target.dataset['title'] || '',
        hint: target.dataset['recommandSize'] || ''
      })

      setModalType((target?.id || "")?.split('-')[0])
    }

  })


  const toastEl = document.getElementById('toast')

  const hideToast = setTimeout(() => {
    if (toastEl?.classList.contains('show')) {
      toastEl.classList.remove('show')
    }
  }, 4000)



  return (
    <section style={{
      display: 'flex',
      justifyContent: "center",
      alignItems: 'center',
   

    }} className=' imageEditor w-auto h-auto  fixed gap-2 z-[9999999]  ' >



      {isOpen && 
        <EditorModal />
     }


  
    </section>
  )
}

export default ImageEditorApp
