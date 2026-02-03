import useIsMobile from "../hooks/useIsMobile";

export const Level4 = () => {
  const { isMobile } = useIsMobile({ maxWidth: 900 });

  if (isMobile) {
    return (
      <div className="flex flex-row justify-center">
        <div className="w-fit h-fit flex flex-col justify-center items-center">
          <div className="flex flex-col justify-start gap-6">
            <div className="flex flex-col gap-4">
              <span className="text-2xl font-bold">
                ❝Example sentence that isn't too long, I need the context, you
                know.❞
              </span>
              <span className="bg-[#56CBF9] w-fit text-2xl">
                Frase de ejemplo que no sea demasiado larga, quiero el contexto
                sabes
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row justify-center">
      <div className="w-fit h-fit flex flex-col justify-center items-center">
        <div className="flex flex-col justify-start gap-6">
          <div className="flex flex-col gap-4">
            <span className="text-4xl font-bold">
              ❝Example sentence that isn't too long, I need the context, you
              know.❞
            </span>
            <span className="bg-[#56CBF9] w-fit text-4xl">
              Frase de ejemplo que no sea demasiado larga, quiero el contexto
              sabes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
