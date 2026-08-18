package com.cwtsh.cartascontrahumanidadeapi.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignUpRequest(
        @NotBlank(message = "O nome é obrigatório")
        @Size(min = 2, max = 80, message = "O nome deve ter entre 2 e 80 caracteres")
        String name,

        @NotBlank(message = "o email é obrigatório")
        @Email(message = "Informe um email válido")
        @Size(max = 320, message = "O email é muito longo")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 8, max = 72, message = "A senha deve ter entre 8 e 72 caracteres")
        String password
) {
}
