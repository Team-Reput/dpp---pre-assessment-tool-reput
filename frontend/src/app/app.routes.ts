import { Routes } from '@angular/router';
import { StartAssessmentComponent } from './start-assessment/start-assessment';
import { EsprDppComponent } from './espr-dpp/espr-dpp';
import { Contact } from './contact/contact';
import { Profile } from './profile/profile';
import { TierFollow } from './tier-follow/tier-follow';
import { Market } from './market/market';
import { Identification } from './identification/identification';
import { MaterialComp } from './material-comp/material-comp';
import { Durability } from './durability/durability';
import { Reusability } from './reusability/reusability';
import { Recyclability } from './recyclability/recyclability';
import { EnvFootprint } from './env-footprint/env-footprint';
import { ResourceUse } from './resource-use/resource-use';
import { WasteEol } from './waste-eol/waste-eol';
import { DataQuality } from './data-quality/data-quality';
import { Compliance } from './compliance/compliance';
import { Structure } from './structure/structure';
import { Positioning } from './positioning/positioning';
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
    path: 'espr-dpp',
    component: EsprDppComponent,
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
    path: 'tier-follow',
    component: TierFollow,
  },
  {
    path: 'market',
    component: Market,
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
    path: 'durability',
    component: Durability,
  },
  {
    path: 'reusability',
    component: Reusability,
  },
  {
    path: 'recyclability',
    component: Recyclability,
  },
  {
    path: 'env-footprint',
    component: EnvFootprint,
  },
  {
    path: 'resource-use',
    component: ResourceUse,
  },
  {
    path: 'waste-eol',
    component: WasteEol,
  },
  {
    path: 'data-quality',
    component: DataQuality,
  },
  {
    path: 'compliance',
    component: Compliance,
  },
  {
    path: 'structure',
    component: Structure,
  },
  {
    path: 'positioning',
    component: Positioning,
  },
  {
    path: 'score',
    component: Score,
  },
];
