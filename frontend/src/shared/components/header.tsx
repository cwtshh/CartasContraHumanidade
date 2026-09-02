import { useSession, useSignOut } from "@/features/auth";
import { useNavigate } from "react-router-dom";
import { routePaths } from "@/app/router/route-paths";
import {
  Avatar,
  AvatarFallback,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
} from "@heroui/react";

export function Header() {
  const navigate = useNavigate();
  const session = useSession();
  const signOut = useSignOut();

  function handleSignOut() {
    signOut.mutate(undefined, {
      onSuccess: () => {
        navigate(routePaths.signIn, { replace: true });
      },
    });
  }

  if (!session.data) {
    return null;
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-8">
      <div className="text-lg font-black tracking-tight">
        C<span className="text-danger">H</span>
      </div>
      <div className="flex items-center gap-3">
        <Dropdown>
          <DropdownTrigger>
            <div className="flex cursor-pointer items-center gap-2">
              <Avatar>
                <AvatarFallback>
                  {session.data.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <span className="font-mono text-xs">
                {session.data.displayName}
              </span>
            </div>
          </DropdownTrigger>
          <DropdownPopover>
            <DropdownMenu>
              <DropdownItem id="profile">Perfil</DropdownItem>
              <DropdownItem id="settings">Configurações</DropdownItem>
              <DropdownItem
                id="logout"
                className="flex items-center justify-center"
              >
                <Button
                  type="button"
                  isDisabled={signOut.isPending}
                  onClick={handleSignOut}
                  className="w-full"
                >
                  {signOut.isPending ? "Saindo..." : "Sair"}
                </Button>
              </DropdownItem>
            </DropdownMenu>
          </DropdownPopover>
        </Dropdown>
      </div>
    </header>
  );
}
