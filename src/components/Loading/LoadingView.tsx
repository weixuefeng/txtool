import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

export function LoadingView(props) {
  const { isOpen, close } = props

  return (
    <Dialog open={isOpen} as="div" className="relative z-10 focus:outline-none" onClose={close}>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="data-[closed]:transform-[scale(95%)] w-full max-w-md rounded-xl bg-white/5 p-6 backdrop-blur-2xl duration-300 ease-out data-[closed]:opacity-0"
          >
            <DialogTitle as="h3" className="text-base/7 font-medium text-white">
              Loading...
            </DialogTitle>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}
