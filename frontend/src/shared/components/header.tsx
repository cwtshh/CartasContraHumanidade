import { useSignOut } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import { routePaths } from "@/app/router/route-paths";
import { useCurrentPlayer } from "@/shared/hooks/use-current-player";
import { clearGuestIdentity } from "@/shared/lib/guest-identity";
import {
  Avatar,
  AvatarFallback,
  Button,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
} from "@heroui/react";

export function Header() {
  const navigate = useNavigate();
  const player = useCurrentPlayer();
  const signOut = useSignOut();

  function handleSignOut() {
    if (player?.isGuest) {
      clearGuestIdentity();
      navigate(routePaths.signIn, { replace: true });
      return;
    }

    signOut.mutate(undefined, {
      onSuccess: () => {
        navigate(routePaths.signIn, { replace: true });
      },
    });
  }

  if (!player) {
    return null;
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-8">
      <div
        role="button"
        onClick={() => navigate(routePaths.home)}
        className="text-lg font-black tracking-tight cursor-pointer"
      >
        C<span className="text-danger">H</span>
      </div>
      <div className="flex items-center gap-3">
        <Dropdown>
          <DropdownTrigger>
            <div className="flex cursor-pointer items-center justify-center gap-2">
              <Avatar>
                <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
              </Avatar>

              <span className="text-sm font-bold ">{player.name}</span>
              {player.isGuest && <Chip color="accent">Convidado</Chip>}
            </div>
          </DropdownTrigger>
          <DropdownPopover>
            <DropdownMenu>
              {!player.isGuest && (
                <>
                  <DropdownItem id="profile">Perfil</DropdownItem>
                  <DropdownItem id="settings">Configurações</DropdownItem>
                </>
              )}
              <DropdownItem
                id="logout"
                className="flex items-center justify-center"
              >
                <Button
                  type="button"
                  isDisabled={!player.isGuest && signOut.isPending}
                  onClick={handleSignOut}
                  className="w-full"
                >
                  {!player.isGuest && signOut.isPending ? "Saindo..." : "Sair"}
                </Button>
              </DropdownItem>
            </DropdownMenu>
          </DropdownPopover>
        </Dropdown>
      </div>
    </header>
  );
}
