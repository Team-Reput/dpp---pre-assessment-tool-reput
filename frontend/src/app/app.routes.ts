import { Routes } from '@angular/router';
import { StartAssessmentComponent } from './start-assessment/start-assessment';
import { Contact } from './contact/contact';
import { Profile } from './profile/profile';
import { Identification } from './identification/identification';
import { MaterialComp } from './material-comp/material-comp';
import { MaterialOrigin } from './material-origin/material-origin';
import { SupplyChain } from './supply-chain/supply-chain';
import { Traceability } from './traceability/traceability';
import { Sustainability } from './sustainability/sustainability';
import { Compliance } from './compliance/compliance';
import { SocialLabor } from './social-labor/social-labor';
import { Structure } from './structure/structure';
import { ExtendedData } from './extended-data/extended-data';
import { Score } from './score/score';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'start-assessment',
    pathMatch: 'full',
  },
  {
    path: 'start-assessment',
    component: StartAssessmentComponent,
  },
  {
    path: 'contact',
    component: Contact,
  },
  {
    path: 'profile',
    component: Profile,
  },
  {
    path: 'identification',
    component: Identification,
  },
  {
    path: 'material-comp',
    component: MaterialComp,
  },
{
    path: 'material-origin',
    component: MaterialOrigin,
  },
  {
    path: 'supply-chain',
    component: SupplyChain,
  },
  {
    path: 'traceability',
    component: Traceability,
  },
  {
    path: 'sustainability',
    component: Sustainability,
  },
  {
    path: 'compliance',
    component: Compliance,
  },
  {
    path: 'social-labor',
    component: SocialLabor,
  },
  {
    path: 'extended-data',
    component: ExtendedData,
  },
  {
    path: 'structure',
    component: Structure,
  },
  {
    path: 'score',
    component: Score,
  }
];