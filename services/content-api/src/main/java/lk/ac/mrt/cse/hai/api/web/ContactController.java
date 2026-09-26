package lk.ac.mrt.cse.hai.api.web;

import lk.ac.mrt.cse.hai.api.contract.api.ContactApi;
import lk.ac.mrt.cse.hai.api.contract.model.ContactMessage;
import lk.ac.mrt.cse.hai.api.contract.model.ContactResult;
import lk.ac.mrt.cse.hai.api.domain.contact.ContactRequest;
import lk.ac.mrt.cse.hai.api.domain.contact.ContactService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ContactController implements ContactApi {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @Override
    public ResponseEntity<ContactResult> sendContactMessage(ContactMessage message) {
        contactService.submit(new ContactRequest(
                message.getName(), message.getEmail(), message.getSubject(), message.getMessage(), message.getWebsite()));
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(new ContactResult().success(true));
    }
}
