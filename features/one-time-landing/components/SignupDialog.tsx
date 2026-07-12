import React from 'react';

export function SignupDialog() {
  return (
    <section className="modal-backdrop" aria-hidden="true" data-signup-modal>
      <div className="signup-dialog" role="dialog" aria-modal="true" aria-labelledby="signupTitle">
        <h2 id="signupTitle">Sign Up Now</h2>
        <form data-signup-form>
          <label>Parent or contact name<input name="parent_name" required autoComplete="name" /></label>
          <label>Email<input name="email" type="email" required autoComplete="email" /></label>
          <label>Phone <span>Optional</span><input name="phone" type="tel" autoComplete="tel" /></label>
          <button type="submit">Sign Up Now</button>
        </form>
      </div>
    </section>
  );
}
