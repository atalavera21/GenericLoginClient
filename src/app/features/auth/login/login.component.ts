import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthService } from '../../../core/auth/auth.service';
// import { LoginRequest } from '../../../core/models/auth/user.model';

import { provideAnimations } from '@angular/platform-browser/animations';
import { LoadingService } from '../../../core/auth/loading.service';
import { SpinnerComponent } from "../../../shared/components/spinner/spinner.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessagesModule,
    MessageModule,
    ToastModule,
    CardModule,
    DividerModule,
    CheckboxModule,
    SpinnerComponent,
    FormsModule 
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

    loginForm!: FormGroup;
    
    constructor(
      private fb: FormBuilder,
      private authService: AuthService,
      private router: Router,
      private messageService: MessageService,
      public loadingService: LoadingService
    ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]],
      recordarme: [false]
    });
  }

  // Aquí irían los métodos comentados que mencionaste:
  // onSubmit()
  // loginWithGoogle()
  // loginWithFacebook()
  // loginWithTwitter()
}