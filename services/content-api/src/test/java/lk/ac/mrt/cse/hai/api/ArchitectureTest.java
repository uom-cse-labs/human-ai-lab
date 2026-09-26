package lk.ac.mrt.cse.hai.api;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

/** Layering rules from technical design §6.2. */
@AnalyzeClasses(packages = "lk.ac.mrt.cse.hai.api", importOptions = ImportOption.DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule domainIsFrameworkFree = noClasses().that().resideInAPackage("..api.domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "org.springframework..", "software.amazon..", "com.amazonaws..", "jakarta..")
            .because("business rules must be testable without Spring or AWS");

    @ArchTest
    static final ArchRule domainDoesNotKnowOuterLayers = noClasses().that().resideInAPackage("..api.domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                    "..api.web..", "..api.adapters..", "..api.contract..", "..api.config..", "..api.security..");

    @ArchTest
    static final ArchRule webDoesNotUseAdapters = noClasses().that().resideInAPackage("..api.web..")
            .should().dependOnClassesThat().resideInAPackage("..api.adapters..")
            .because("controllers talk to use cases, which talk to ports");

    @ArchTest
    static final ArchRule adaptersDoNotUseTheWebLayer = noClasses().that().resideInAPackage("..api.adapters..")
            .should().dependOnClassesThat().resideInAnyPackage("..api.web..", "..api.contract.api..")
            .because("adapters may use contract models for release files, but not the HTTP interfaces");
}
