package com.cwtsh.cartascontrahumanidadeapi.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignInRequest(
        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Informe um email válido")
        @Size(max = 320, message = "O email é muito longo")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(max = 72, message = "A senha deve ter no máximo 72 caracteres")
        String password
) {
}
